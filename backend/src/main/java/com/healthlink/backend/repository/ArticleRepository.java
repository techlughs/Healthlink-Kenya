package com.healthlink.backend.repository;

import com.healthlink.backend.model.Article;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ArticleRepository extends MongoRepository<Article, String> {

    List<Article> findAllByOrderByCreatedAtDesc();
}