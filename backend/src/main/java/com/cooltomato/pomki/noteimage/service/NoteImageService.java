package com.cooltomato.pomki.noteimage.service;

import com.cooltomato.pomki.global.exception.BadRequestException;
import com.cooltomato.pomki.global.exception.EmptyFileException;
import com.cooltomato.pomki.global.exception.NoteNotFoundException;
import com.cooltomato.pomki.global.exception.UnsupportedFormatException;
import com.cooltomato.pomki.global.exception.UploadFailedException;
import com.cooltomato.pomki.global.exception.ProcessingFailedException;
import com.cooltomato.pomki.global.exception.S3OperationFailedException;
import com.cooltomato.pomki.noteimage.dto.NoteImageRequestDto;
import com.cooltomato.pomki.noteimage.dto.NoteImageResponseDto;
import com.cooltomato.pomki.noteimage.entity.NoteImage;
import com.cooltomato.pomki.noteimage.repository.NoteImageRepository;
import com.cooltomato.pomki.note.entity.Note;
import com.cooltomato.pomki.note.repository.NoteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NoteImageService {

    private final S3Client s3Client;
    private final NoteImageRepository noteImageRepository;
    private final NoteRepository noteRepository;

    @Value("${pomki.s3.bucket-name}")
    private String bucketName;

    @Value("${pomki.image.allowed-extensions:jpeg,jpg,png,gif,webp}")
    private String[] allowedExtensions;

    @Value("${pomki.image.resize.width:1280}")
    private int resizeWidth;

    @Value("${pomki.image.resize.height:720}")
    private int resizeHeight;

    @Transactional
    public NoteImageResponseDto uploadImage(NoteImageRequestDto requestDto) {
        MultipartFile file = requestDto.getImageFile();
        String noteId = requestDto.getNoteId();

        // noteId가 null이 아닌 경우에만 노트 조회
        Note note = null;
        if (noteId != null && !noteId.trim().isEmpty()) {
            note = noteRepository.findById(noteId)
                    .orElseThrow(() -> new NoteNotFoundException("해당 ID의 노트를 찾을 수 없습니다."));
        }

        if (file.isEmpty()) {
            throw new EmptyFileException("이미지 파일이 비어있습니다.");
        }

        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null || !hasAllowedExtension(originalFileName)) {
            throw new UnsupportedFormatException("지원하지 않는 이미지 형식입니다. 지원 형식: " + 
                    String.join(", ", allowedExtensions));
        }

        try {
            String fileExtension = getFileExtension(originalFileName);
            String mimeType = file.getContentType();
            long fileSize = file.getSize();

            String timestamp = ZonedDateTime.now(ZoneOffset.UTC).format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
            String uuid = UUID.randomUUID().toString().replace("-", "");
            
            StringBuilder sb = new StringBuilder();
            
            String uniqueFileName = sb.append(timestamp)
                    .append("_")
                    .append(uuid)
                    .append(".")
                    .append(fileExtension)
                    .toString();
            
            sb.setLength(0);
            String baseFileName = sb.append(timestamp)
                    .append("_")
                    .append(uuid)
                    .toString();
            
            String s3Key = "images/" + baseFileName;
            String resizeS3Key = "images/resize_" + baseFileName;

            String imageUrl = uploadToS3(s3Key, file.getBytes(), mimeType);

            byte[] resizedImageBytes = resizeImage(file.getInputStream(), fileExtension);
            String resizeImageUrl = uploadToS3(resizeS3Key, resizedImageBytes, mimeType);

            NoteImage noteImage = NoteImage.builder()
                    .note(note)
                    .imageUrl(imageUrl)
                    .imageName(uniqueFileName)
                    .fileSize(fileSize)
                    .mimeType(mimeType)
                    .oriFileName(originalFileName)
                    .resizeImageUrl(resizeImageUrl)
                    .build();

            NoteImage savedNoteImage = noteImageRepository.save(noteImage);
            log.info("이미지 업로드 완료: noteId={}, imageId={}", noteId, savedNoteImage.getImageId());

            return NoteImageResponseDto.builder()
                    .imageId(savedNoteImage.getImageId())
                    .noteId(savedNoteImage.getNote() != null ? savedNoteImage.getNote().getNoteId() : null)
                    .imageUrl(savedNoteImage.getImageUrl())
                    .imageName(savedNoteImage.getImageName())
                    .fileSize(savedNoteImage.getFileSize())
                    .mimeType(savedNoteImage.getMimeType())
                    .createdAt(savedNoteImage.getCreatedAt())
                    .oriFileName(savedNoteImage.getOriFileName())
                    .resizeImageUrl(savedNoteImage.getResizeImageUrl())
                    .build();
        } catch (IOException e) {
            log.error("이미지 업로드 중 오류 발생: {}", e.getMessage(), e);
            throw new UploadFailedException("이미지 업로드에 실패했습니다.", e);
        }
    }

    @Transactional
    public List<NoteImageResponseDto> uploadMultipleImages(String noteId, List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new EmptyFileException("업로드할 이미지 파일이 없습니다.");
        }

        List<NoteImageResponseDto> results = new ArrayList<>();
        
        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                NoteImageRequestDto requestDto = NoteImageRequestDto.builder()
                        .noteId(noteId) // noteId는 null일 수 있음
                        .imageFile(file)
                        .build();
                
                results.add(uploadImage(requestDto));
            }
        }
        
        log.info("다중 이미지 업로드 완료: noteId={}, 업로드된 이미지 수={}", noteId, results.size());
        return results;
    }

    @Transactional(readOnly = true)
    public List<NoteImageResponseDto> readImagesByNoteId(String noteId) {
        List<NoteImage> images = noteImageRepository.findByNote_NoteId(noteId);
        return images.stream()
                .map(image -> NoteImageResponseDto.builder()
                        .imageId(image.getImageId())
                        .noteId(image.getNote().getNoteId())
                        .imageUrl(image.getImageUrl())
                        .imageName(image.getImageName())
                        .fileSize(image.getFileSize())
                        .mimeType(image.getMimeType())
                        .createdAt(image.getCreatedAt())
                        .oriFileName(image.getOriFileName())
                        .resizeImageUrl(image.getResizeImageUrl())
                        .build())
                .toList();
    }

    @Transactional
    public void deleteImagesByNoteId(String noteId) {
        List<NoteImage> images = noteImageRepository.findByNote_NoteId(noteId);
        
        for (NoteImage image : images) {
            deleteFromS3(extractS3KeyFromUrl(image.getImageUrl()));
            if (image.getResizeImageUrl() != null) {
                deleteFromS3(extractS3KeyFromUrl(image.getResizeImageUrl()));
            }
        }

        noteImageRepository.deleteByNote_NoteId(noteId);
        log.info("노트 이미지 삭제 완료: noteId={}, 삭제된 이미지 수={}", noteId, images.size());
    }

    private boolean hasAllowedExtension(String fileName) {
        String extension = getFileExtension(fileName).toLowerCase();
        return Arrays.asList(allowedExtensions).contains(extension);
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1);
    }

    private String uploadToS3(String s3Key, byte[] fileBytes, String mimeType) {
        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .contentType(mimeType)
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(fileBytes));
            
            String imageUrl = new StringBuilder()
                    .append("https://")
                    .append(bucketName)
                    .append(".s3.ap-northeast-2.amazonaws.com/")
                    .append(s3Key)
                    .toString();

            return imageUrl;
        } catch (Exception e) {
            log.error("S3 업로드 실패: {}", e.getMessage(), e);
            throw new S3OperationFailedException("S3 업로드에 실패했습니다.", e);
        }
    }

    private byte[] resizeImage(java.io.InputStream inputStream, String extension) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        
        try {
            Thumbnails.of(inputStream)
                    .size(resizeWidth, resizeHeight)
                    .keepAspectRatio(true)
                    .outputQuality(0.8)
                    .outputFormat(extension.toLowerCase().equals("jpg") ? "jpeg" : extension.toLowerCase())
                    .toOutputStream(outputStream);
            
            return outputStream.toByteArray();
        } catch (Exception e) {
            log.error("이미지 리사이징 실패: {}", e.getMessage(), e);
            throw new ProcessingFailedException("이미지 리사이징에 실패했습니다.", e);
        } finally {
            outputStream.close();
        }
    }

    private void deleteFromS3(String s3Key) {
        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            log.debug("S3 파일 삭제 완료: {}", s3Key);
        } catch (Exception e) {
            log.error("S3 파일 삭제 실패: {}, 오류: {}", s3Key, e.getMessage());
            throw new S3OperationFailedException("S3 파일 삭제에 실패했습니다: " + s3Key, e);
        }
    }

    private String extractS3KeyFromUrl(String url) {
        if (url == null) return "";
        
        String[] parts = url.split("/", 4);
        return parts.length > 3 ? parts[3] : "";
    }
} 