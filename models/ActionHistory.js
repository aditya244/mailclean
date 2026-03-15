import mongoose from 'mongoose'

// Stores a record of every action taken on emails.
// This gives users an audit trail and lets us show
// "you deleted 241 emails on March 15" in a history view later.

const ActionHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      // 'archive' | 'trash' | 'label'
      type: String,
      required: true,
    },
    category: {
      // Which category this action was applied to
      type: String,
      required: true,
    },
    emailCount: {
      // How many emails were affected
      type: Number,
      required: true,
    },
    labelName: {
      // Only set for 'label' actions
      type: String,
    },
    messageIds: {
      // The actual Gmail message IDs affected
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.ActionHistory ||
  mongoose.model('ActionHistory', ActionHistorySchema)