package com.healthlink.backend.service;

import com.healthlink.backend.exception.ResourceNotFoundException;
import com.healthlink.backend.model.Article;
import com.healthlink.backend.repository.ArticleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ArticleService {

    @Autowired
    private ArticleRepository articleRepository;

    public Article createArticle(Article article) {
        article.setId(null);
        article.setCreatedAt(LocalDateTime.now());
        article.setUpdatedAt(LocalDateTime.now());
        return articleRepository.save(article);
    }

    public Article updateArticle(String id, Article updates) {
        Article existing = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found"));

        existing.setTitle(updates.getTitle());
        existing.setContent(updates.getContent());
        existing.setCoverImageUrl(updates.getCoverImageUrl());
        existing.setUpdatedAt(LocalDateTime.now());

        return articleRepository.save(existing);
    }

    public void deleteArticle(String id) {
        if (!articleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Article not found");
        }
        articleRepository.deleteById(id);
    }

    public List<Article> getAllArticles() {
        return articleRepository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<Article> getArticleById(String id) {
        return articleRepository.findById(id);
    }
}