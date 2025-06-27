package com.cooltomato.pomki.tag.entity;

import lombok.*;
import java.io.Serializable;

@Data
public class NoteTagId implements Serializable {
    private Long tag;
    private String note;
}