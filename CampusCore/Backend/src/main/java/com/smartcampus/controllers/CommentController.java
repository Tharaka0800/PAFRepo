package com.smartcampus.controllers;

import com.smartcampus.models.TicketComment;
import com.smartcampus.services.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/v1")
public class CommentController {

    @Autowired
    private CommentService commentService;

    // Get all comments for a ticket
    @GetMapping("/tickets/{ticketId}/comments")
    public ResponseEntity<List<TicketComment>> getComments(@PathVariable String ticketId) {
        return ResponseEntity.ok(commentService.getCommentsByTicketId(ticketId));
    }

    // Add a comment
    @PostMapping("/tickets/{ticketId}/comments")
    public ResponseEntity<TicketComment> addComment(
            @PathVariable String ticketId,
            @RequestBody TicketComment comment,
            @RequestHeader(value = "X-User-Id", defaultValue = "user_default") String userId,
            @RequestHeader(value = "X-User-Name", defaultValue = "User") String userName) {
            
        comment.setTicketId(ticketId);
        comment.setUserId(userId);
        if (comment.getAuthorName() == null) {
            comment.setAuthorName(userName);
        }
        
        return new ResponseEntity<>(commentService.addComment(comment), HttpStatus.CREATED);
    }

    // Update comment
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<TicketComment> updateComment(
            @PathVariable String commentId,
            @RequestBody Map<String, String> payload,
            @RequestHeader(value = "X-User-Id", defaultValue = "user_default") String userId) {
            
        return ResponseEntity.ok(commentService.updateComment(commentId, payload.get("text"), userId));
    }

    // Delete comment
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String commentId,
            @RequestHeader(value = "X-User-Id", defaultValue = "user_default") String userId) {
            
        commentService.deleteComment(commentId, userId);
        return ResponseEntity.noContent().build();
    }
}
