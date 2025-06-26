import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { 
  fetchNote, 
  updateNoteAsync, 
  deleteNoteAsync, 
  toggleBookmark,
  clearCurrentNote,
  fetchNotes
} from '../../store/slices/noteSlice';

const SimpleNoteDetail: React.FC = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { currentNote, loading } = useAppSelector(state => state.note);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (noteId) {
      dispatch(fetchNote(noteId));
    }
    
    return () => {
      dispatch(clearCurrentNote());
    };
  }, [noteId, dispatch]);

  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
    }
  }, [currentNote]);

  const handleSave = async () => {
    if (!noteId || !title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      await dispatch(updateNoteAsync({
        noteId,
        data: {
          noteTitle: title.trim(),
          noteContent: content.trim(),
        }
      })).unwrap();
      
      await dispatch(fetchNotes({}));
      setIsEditing(false);
      alert('노트가 수정되었습니다!');
    } catch {
      alert('노트 수정에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!noteId) return;
    
    const confirmed = window.confirm('정말로 이 노트를 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
      await dispatch(deleteNoteAsync(noteId)).unwrap();
      await dispatch(fetchNotes({}));
      alert('노트가 삭제되었습니다.');
      navigate('/note');
    } catch {
      alert('노트 삭제에 실패했습니다.');
    }
  };

  const handleBookmarkToggle = async () => {
    if (!noteId) return;
    
    try {
      await dispatch(toggleBookmark(noteId)).unwrap();
      await dispatch(fetchNotes({}));
    } catch {
      alert('북마크 토글에 실패했습니다.');
    }
  };

  if (loading || !currentNote) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>로딩 중...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '8px',
              width: '60%'
            }}
          />
        ) : (
          <h1 style={{ margin: 0 }}>{currentNote.title}</h1>
        )}
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleBookmarkToggle}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '24px'
            }}
          >
            {currentNote.isBookmarked ? '★' : '☆'}
          </button>
          
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                저장
              </button>
              <button
                onClick={() => setIsEditing(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                수정
              </button>
              <button
                onClick={handleDelete}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                삭제
              </button>
            </>
          )}
          
          <button 
            onClick={() => navigate('/note')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            목록으로
          </button>
        </div>
      </div>

      {/* 태그 표시/편집 - 임시로 비활성화 */}

      {/* 내용 표시/편집 */}
      {isEditing ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={15}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: 'inherit',
            resize: 'vertical'
          }}
        />
      ) : (
        <div style={{
          padding: '16px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          lineHeight: '1.6',
          whiteSpace: 'pre-wrap'
        }}>
          {currentNote.content}
        </div>
      )}

      {/* 생성/수정 일시 */}
      <div style={{ 
        marginTop: '20px', 
        padding: '12px',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#666'
      }}>
        <div>생성일: {new Date(currentNote.createdAt).toLocaleString()}</div>
        <div>수정일: {new Date(currentNote.updatedAt).toLocaleString()}</div>
      </div>
    </div>
  );
};

export default SimpleNoteDetail; 