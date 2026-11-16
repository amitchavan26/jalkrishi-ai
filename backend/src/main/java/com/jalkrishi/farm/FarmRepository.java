package com.jalkrishi.farm;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface FarmRepository extends MongoRepository<Farm, String> {
    List<Farm> findByOwnerId(String ownerId);
    Farm findByIdAndOwnerId(String id, String ownerId);
}