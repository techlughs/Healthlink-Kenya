package com.healthlink.backend.controller;

import com.healthlink.backend.exception.ResourceNotFoundException;
import com.healthlink.backend.model.Article;
import com.healthlink.backend.service.ArticleService;
import com.healthlink.backend.service.AuditService;
import com.healthlink.backend.security.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
public class ArticleController {

    @Autowired
    private ArticleService articleService;

    @Autowired
    private AuditService auditService;

    // --- Admin: create/update/delete/list, protected by SecurityConfig's
    // "/api/admin/**" -> hasRole("ADMIN") rule ---

    @PostMapping("/api/admin/articles")
    public ResponseEntity<Article> createArticle(
            @Valid @RequestBody Article article,
            HttpServletRequest request) {
        String email = SecurityUtils.getCurrentEmail();
        article.setAuthorId(email);
        if (article.getAuthorName() == null || article.getAuthorName().isBlank()) {
            article.setAuthorName("HealthLink Kenya");
        }

        Article saved = articleService.createArticle(article);
        auditService.log(
                email,
                "ARTICLE_CREATED",
                "Published article " + saved.getId() + " (\"" + saved.getTitle() + "\")",
                getClientIp(request)
        );
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/api/admin/articles/{id}")
    public ResponseEntity<Article> updateArticle(
            @PathVariable String id,
            @Valid @RequestBody Article updates,
            HttpServletRequest request) {
        Article updated = articleService.updateArticle(id, updates);
        auditService.log(
                SecurityUtils.getCurrentEmail(),
                "ARTICLE_UPDATED",
                "Updated article " + id + " (\"" + updated.getTitle() + "\")",
                getClientIp(request)
        );
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/api/admin/articles/{id}")
    public ResponseEntity<Void> deleteArticle(
            @PathVariable String id,
            HttpServletRequest request) {
        articleService.deleteArticle(id);
        auditService.log(
                SecurityUtils.getCurrentEmail(),
                "ARTICLE_DELETED",
                "Deleted article " + id,
                getClientIp(request)
        );
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/admin/articles")
    public ResponseEntity<List<Article>> getAllArticlesForAdmin() {
        return ResponseEntity.ok(articleService.getAllArticles());
    }

    // --- Patient-facing reads: any authenticated user (falls under
    // SecurityConfig's default "anyRequest().authenticated()") ---

    @GetMapping("/api/articles")
    public ResponseEntity<List<Article>> getAllArticles() {
        return ResponseEntity.ok(articleService.getAllArticles());
    }

    @GetMapping("/api/articles/{id}")
    public ResponseEntity<Article> getArticleById(@PathVariable String id) {
        Article article = articleService.getArticleById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found"));
        return ResponseEntity.ok(article);
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}