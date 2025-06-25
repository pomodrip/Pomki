package com.cooltomato.pomki.bookmark.entity;

import lombok.*;
import java.io.Serializable;

@Data
public class BookmarkId implements Serializable {
    private Long member;
    private String note;
}