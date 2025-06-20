package com.cooltomato.pomki.tag.entity;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import lombok.Data;

@Entity
@Table(name = "tag")
@Data
public class Tag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tag_id")
    private Long tagId;

    @Column(name = "member_id", nullable = false)
    private Long memberId;

    @Column(name = "tag_name", nullable = false, length = 50)
    private String tagName;

    // 연관관계: NOTE_TAG(1:N)
    @OneToMany(mappedBy = "tag", cascade = CascadeType.ALL)
    private List<NoteTag> noteTags;
}
