const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    minlength: [1, 'Task title cannot be empty'],
    maxlength: [100, 'Task title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function(value) {
        // Allow null/undefined or future dates (including today)
        if (!value) return true;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(value);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate >= today;
      },
      message: 'Due date must be today or in the future'
    }
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high'],
      message: 'Priority must be low, medium, or high'
    },
    default: 'medium'
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'in-progress', 'completed'],
      message: 'Status must be pending, in-progress, or completed'
    },
    default: 'pending'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Task must belong to a user']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  isImportant: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for task status
taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.status === 'completed') return false;
  return new Date() > this.dueDate;
});

taskSchema.virtual('isDueSoon').get(function() {
  if (!this.dueDate || this.status === 'completed') return false;
  const now = new Date();
  const dueDate = new Date(this.dueDate);
  const diffTime = dueDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 3 && diffDays >= 0;
});

// Virtual for formatted due date
taskSchema.virtual('formattedDueDate').get(function() {
  if (!this.dueDate) return null;
  return this.dueDate.toISOString().split('T')[0];
});

// Indexes for better query performance
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, priority: 1 });
taskSchema.index({ user: 1, dueDate: 1 });
taskSchema.index({ user: 1, createdAt: -1 });
taskSchema.index({ title: 'text', description: 'text' });

// Pre-save middleware to handle completion
taskSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  } else if (this.isModified('status') && this.status !== 'completed') {
    this.completedAt = null;
  }
  next();
});

// Instance method to mark as completed
taskSchema.methods.markAsCompleted = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Instance method to mark as in progress
taskSchema.methods.markAsInProgress = function() {
  this.status = 'in-progress';
  this.completedAt = null;
  return this.save();
};

// Instance method to mark as pending
taskSchema.methods.markAsPending = function() {
  this.status = 'pending';
  this.completedAt = null;
  return this.save();
};

// Instance method to toggle importance
taskSchema.methods.toggleImportance = function() {
  this.isImportant = !this.isImportant;
  return this.save();
};

// Static method to get user's tasks with filters
taskSchema.statics.getUserTasks = function(userId, filters = {}) {
  const query = { user: userId };
  
  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;
  if (filters.isImportant !== undefined) query.isImportant = filters.isImportant;
  
  if (filters.search) {
    query.$text = { $search: filters.search };
  }
  
  return this.find(query)
    .sort(filters.sort || { createdAt: -1 })
    .populate('user', 'name email');
};

// Static method to get overdue tasks
taskSchema.statics.getOverdueTasks = function(userId) {
  return this.find({
    user: userId,
    status: { $ne: 'completed' },
    dueDate: { $lt: new Date() }
  }).populate('user', 'name email');
};

// Static method to get tasks due soon
taskSchema.statics.getTasksDueSoon = function(userId, days = 3) {
  const now = new Date();
  const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
  
  return this.find({
    user: userId,
    status: { $ne: 'completed' },
    dueDate: { $gte: now, $lte: futureDate }
  }).populate('user', 'name email');
};

module.exports = mongoose.model('Task', taskSchema);

