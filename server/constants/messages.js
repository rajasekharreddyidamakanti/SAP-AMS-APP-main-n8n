module.exports = {
    AUTH: {
        REGISTER_SUCCESS: "Registration successful. Waiting for admin approval.",
        LOGIN_SUCCESS: "Login successful",
        INVALID_CREDENTIALS: "Invalid email or password",
        ACCOUNT_PENDING: "Your account is pending admin approval.",
        ACCOUNT_REJECTED: "Your account has been rejected."
    },

    ARTICLE: {
        CREATED: "Article created successfully",
        UPDATED: "Article updated successfully",
        DELETED: "Article deleted successfully",
        FETCHED: "Article fetched successfully",
        APPROVED: "Article approved successfully",
        REJECTED: "Article rejected successfully"
    },

    SECTION: {
        CREATED: "Section created successfully",
        UPDATED: "Section updated successfully",
        DELETED: "Section deleted successfully"
    },

    ATTACHMENT: {
        UPLOADED: "Attachment uploaded successfully",
        DELETED: "Attachment deleted successfully"
    },

    TAG: {
        CREATED: "Tag created successfully",
        ASSIGNED: "Tag assigned successfully",
        APPROVED: "Tag approved successfully",
        REJECTED: "Tag rejected successfully"
    },

    ROLE: {
        CREATED: "Role created successfully",
        UPDATED: "Role updated successfully"
    },

    DASHBOARD: {
        FETCHED: "Dashboard statistics fetched successfully"
    },

    COMMON: {
        CREATED: "Created successfully",
        UPDATED: "Updated successfully",
        DELETED: "Deleted successfully",
        FETCHED: "Data fetched successfully",
        NOT_FOUND: "Resource not found",
        SERVER_ERROR: "Internal Server Error",
        VALIDATION_FAILED: "Validation failed"
    },

    AI: {
        ARTICLE_RESTRICTED:"This article is restricted. Please contact the article owner or administrator.",

        KNOWLEDGE_NOT_FOUND:"The knowledge base does not contain enough information to answer this query."
    },

    CHAT: {
        REQUEST_SENT: "Expert request sent successfully.",
        REQUEST_ACCEPTED: "Expert request accepted.",
        REQUEST_REJECTED: "Expert request rejected.",

        MESSAGE_SENT: "Message sent successfully.",

        SESSION_NOT_FOUND: "Chat session not found.",
        SESSION_CLOSED: "Chat session is closed.",

        REQUEST_NOT_FOUND: "Expert request not found.",
        REQUEST_NOT_PENDING: "Request is no longer pending.",
        REQUEST_DELETED: "Expert request deleted successfully.",
        REQUEST_DELETE_FORBIDDEN: "You can only delete your own requests.",
        REQUEST_DELETE_ACCEPTED: "This request has already been accepted and cannot be deleted. Please close the chat first.",
        SESSION_CLOSED_SUCCESS: "Chat session closed successfully.",
        SESSION_NOT_FOUND: "Chat session not found.",
        
    },

    NOTIFICATION: {
        CREATED: "Notification created successfully.",
        READ: "Notification marked as read.",
        READ_ALL: "All notifications marked as read."
    },
};