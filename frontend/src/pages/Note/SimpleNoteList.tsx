import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { 
  fetchNotes, 
  deleteNoteAsync, 
  toggleBookmark 
} from '../../store/slices/noteSlice';

const SimpleNoteList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { notes, loading, error } = useAppSelector(state => state.note);
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchNotes({}));
  }, [dispatch]);

  const handleDelete = async (noteId: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await dispatch(deleteNoteAsync(noteId)).unwrap();
        dispatch(fetchNotes({}));
      } catch (error) {
        alert('삭제 실패');
      }
    }
  };

  const handleBookmark = async (noteId: string) => {
    try {
      await dispatch(toggleBookmark(noteId)).unwrap();
      dispatch(fetchNotes({}));
    } catch (error) {
      alert('북마크 토글 실패');
    }
  };

  const filteredNotes = (notes || []).filter(note => 
    (note.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (note.content || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>로딩 중...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>에러: {error}</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>노트 목록</h1>
        <button 
          onClick={() => navigate('/note/create')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          새 노트 작성
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="노트 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px'
          }}
        />
      </div>

      {filteredNotes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>노트가 없습니다.</p>
          <button 
            onClick={() => navigate('/note/create')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            첫 번째 노트 작성하기
          </button>
        </div>
      ) : (
        <div>
          {filteredNotes.map(note => (
            <div 
              key={note.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                <h3 
                  style={{ 
                    margin: 0, 
                    cursor: 'pointer',
                    color: '#1976d2'
                  }}
                  onClick={() => navigate(`/note/${note.id}`)}
                >
                  {note.title}
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleBookmark(note.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '18px'
                    }}
                  >
                    {note.isBookmarked ? '★' : '☆'}
                  </button>
                  <button
                    onClick={() => navigate(`/note/${note.id}`)}
                    style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      border: '1px solid #f44336',
                      borderRadius: '4px',
                      background: 'white',
                      color: '#f44336',
                      cursor: 'pointer'
                    }}
                  >
                    삭제
                  </button>
                </div>
              </div>

              <p style={{
                margin: '0 0 10px 0',
                color: '#666',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical'
              }}>
                {note.content}
              </p>

              {(note.tags || []).length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  {(note.tags || []).map(tag => (
                    <span
                      key={tag.id}
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        marginRight: '8px',
                        backgroundColor: '#e3f2fd',
                        color: '#1976d2',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}
                    >
                      {tag.tagName}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ fontSize: '12px', color: '#999', textAlign: 'right', marginTop: '10px' }}>
                최종 수정: {new Date(note.updatedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimpleNoteList; 