const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Task = require('../models/Task');
const { protect } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// @desc    Get all tasks for user
// @route   GET /api/tasks
// @access  Private
router.get('/', [
  query('status')
    .optional()
    .notEmpty()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be pending, in-progress, or completed'),
  
  query('priority')
    .optional()
    .notEmpty()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  
  query('sort')
    .optional()
    .notEmpty()
    .isIn(['title', 'dueDate', 'priority', 'status', 'createdAt', 'updatedAt'])
    .withMessage('Invalid sort field'),
  
  query('order')
    .optional()
    .notEmpty()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc'),
  
  query('search')
    .optional()
    .notEmpty()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array()[0].msg
    });
  }

  const { status, priority, search, sort = 'createdAt', order = 'desc', page = 1, limit = 20 } = req.query;

  // Build filters
  const filters = { user: req.user._id };
  if (status && status.trim()) filters.status = status;
  if (priority && priority.trim()) filters.priority = priority;
  if (search && search.trim()) {
    filters.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Build sort object
  const sortObj = {};
  if (sort && sort.trim()) {
    sortObj[sort] = order === 'desc' ? -1 : 1;
  } else {
    sortObj.createdAt = -1; // Default sort
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Get tasks
  const tasks = await Task.find(filters)
    .sort(sortObj)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('user', 'name email');

  // Get total count for pagination
  const total = await Task.countDocuments(filters);

  // Get statistics
  const stats = await Task.aggregate([
    { $match: { user: req.user._id } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
        highPriority: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
        overdue: { $sum: { $cond: [{ $and: [{ $ne: ['$status', 'completed'] }, { $lt: ['$dueDate', new Date()] }] }, 1, 0] } }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      stats: stats[0] || {
        total: 0,
        completed: 0,
        pending: 0,
        inProgress: 0,
        highPriority: 0,
        overdue: 0
      }
    }
  });
}));

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
router.get('/:id', asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate('user', 'name email');

  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }

  // Check if task belongs to user
  if (task.user._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to access this task'
    });
  }

  res.json({
    success: true,
    data: { task }
  });
}));

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
router.post('/', [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be pending, in-progress, or completed'),
  
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Tags must be an array with maximum 10 items'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Each tag must be between 1 and 20 characters'),
  
  body('isImportant')
    .optional()
    .isBoolean()
    .withMessage('isImportant must be a boolean')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array()[0].msg
    });
  }

  const { title, description, dueDate, priority, status, tags, isImportant } = req.body;

  // Validate due date is today or in the future
  if (dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDateObj = new Date(dueDate);
    dueDateObj.setHours(0, 0, 0, 0);
    
    if (dueDateObj < today) {
      return res.status(400).json({
        success: false,
        error: 'Due date must be today or in the future'
      });
    }
  }

  const task = await Task.create({
    title,
    description,
    dueDate,
    priority,
    status,
    tags: tags || [],
    isImportant: isImportant || false,
    user: req.user._id
  });

  await task.populate('user', 'name email');

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: { task }
  });
}));

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
router.put('/:id', [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be pending, in-progress, or completed'),
  
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Tags must be an array with maximum 10 items'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Each tag must be between 1 and 20 characters'),
  
  body('isImportant')
    .optional()
    .isBoolean()
    .withMessage('isImportant must be a boolean')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array()[0].msg
    });
  }

  let task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }

  // Check if task belongs to user
  if (task.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to update this task'
    });
  }

  const { title, description, dueDate, priority, status, tags, isImportant } = req.body;

  // Validate due date is in the future (unless task is being completed)
  if (dueDate && new Date(dueDate) < new Date() && status !== 'completed') {
    return res.status(400).json({
      success: false,
      error: 'Due date must be in the future'
    });
  }

  // Update task
  task = await Task.findByIdAndUpdate(
    req.params.id,
    {
      title,
      description,
      dueDate,
      priority,
      status,
      tags,
      isImportant
    },
    { new: true, runValidators: true }
  ).populate('user', 'name email');

  res.json({
    success: true,
    message: 'Task updated successfully',
    data: { task }
  });
}));

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
router.delete('/:id', asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }

  // Check if task belongs to user
  if (task.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to delete this task'
    });
  }

  await Task.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Task deleted successfully'
  });
}));

// @desc    Toggle task importance
// @route   PATCH /api/tasks/:id/toggle-importance
// @access  Private
router.patch('/:id/toggle-importance', asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }

  // Check if task belongs to user
  if (task.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to modify this task'
    });
  }

  await task.toggleImportance();
  await task.populate('user', 'name email');

  res.json({
    success: true,
    message: `Task marked as ${task.isImportant ? 'important' : 'not important'}`,
    data: { task }
  });
}));

// @desc    Mark task as completed
// @route   PATCH /api/tasks/:id/complete
// @access  Private
router.patch('/:id/complete', asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }

  // Check if task belongs to user
  if (task.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to modify this task'
    });
  }

  await task.markAsCompleted();
  await task.populate('user', 'name email');

  res.json({
    success: true,
    message: 'Task marked as completed',
    data: { task }
  });
}));

// @desc    Get overdue tasks
// @route   GET /api/tasks/overdue
// @access  Private
router.get('/overdue', asyncHandler(async (req, res) => {
  const tasks = await Task.getOverdueTasks(req.user._id);

  res.json({
    success: true,
    data: { tasks }
  });
}));

// @desc    Get tasks due soon
// @route   GET /api/tasks/due-soon
// @access  Private
router.get('/due-soon', [
  query('days')
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage('Days must be between 1 and 30')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array()[0].msg
    });
  }

  const days = parseInt(req.query.days) || 3;
  const tasks = await Task.getTasksDueSoon(req.user._id, days);

  res.json({
    success: true,
    data: { tasks }
  });
}));

module.exports = router;

