package com.smartcampus.services;

import com.smartcampus.exceptions.ResourceNotFoundException;
import com.smartcampus.exceptions.UnauthorizedException;
import com.smartcampus.models.TicketComment;
import com.smartcampus.repositories.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    public TicketComment addComment(TicketComment comment) {
        comment.setCreatedAt(java.time.LocalDateTime.now());
        return commentRepository.save(comment);
    }

    public List<TicketComment> getCommentsByTicketId(String ticketId) {
        return commentRepository.findByTicketId(ticketId);
    }

    public TicketComment updateComment(String id, String text, String userId) {
        TicketComment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
                
        // Ownership check
        if (!comment.getUserId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to edit this comment");
        }
        
        comment.setText(text);
        return commentRepository.save(comment);
    }

    public void deleteComment(String id, String userId) {
        TicketComment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
                
        // Ownership check (an ADMIN might bypass this later)
        if (!comment.getUserId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to delete this comment");
        }
        
        commentRepository.delete(comment);
    }
}
