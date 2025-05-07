import os
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from django.conf import settings
from .models import DocumentChunk
from songs.models import Song
from artists.models import Artist
from albums.models import Album

class RAGService:
    def __init__(self):
        # Khởi tạo model embedding
        self.model = SentenceTransformer('paraphrase-MiniLM-L6-v2')
        self.index = None
        self.document_ids = []
        self.initialize_index()
    
    def initialize_index(self):
        """Khởi tạo FAISS index từ database"""
        documents = DocumentChunk.objects.all()
        
        if not documents:
            # Nếu chưa có dữ liệu, tạo dữ liệu mới
            self.create_document_chunks()
            documents = DocumentChunk.objects.all()
        
        if documents:
            # Tạo index từ embeddings đã lưu
            embeddings = []
            self.document_ids = []
            
            for doc in documents:
                if doc.embedding:
                    embeddings.append(np.array(doc.embedding, dtype=np.float32))
                    self.document_ids.append(doc.id)
            
            if embeddings:
                dimension = len(embeddings[0])
                self.index = faiss.IndexFlatL2(dimension)
                self.index.add(np.array(embeddings))
    
    def create_document_chunks(self):
        """Tạo các document chunks từ dữ liệu của ứng dụng"""
        # Xử lý bài hát
        songs = Song.objects.all()
        for song in songs:
            content = f"Bài hát: {song.title}. "
            if song.album:
                content += f"Album: {song.album.title}. "
            if song.artists.exists():
                artists = ", ".join([artist.name for artist in song.artists.all()])
                content += f"Nghệ sĩ: {artists}. "
            
            # Tạo document chunk
            chunk = DocumentChunk(
                content=content,
                source_type='song',
                source_id=song.id
            )
            # Tạo embedding
            embedding = self.model.encode(content)
            chunk.embedding = embedding.tolist()
            chunk.save()
        
        # Xử lý nghệ sĩ
        artists = Artist.objects.all()
        for artist in artists:
            content = f"Nghệ sĩ: {artist.name}. "
            if artist.bio:
                content += f"Tiểu sử: {artist.bio}. "
            
            chunk = DocumentChunk(
                content=content,
                source_type='artist',
                source_id=artist.id
            )
            embedding = self.model.encode(content)
            chunk.embedding = embedding.tolist()
            chunk.save()
        
        # Xử lý album
        albums = Album.objects.all()
        for album in albums:
            content = f"Album: {album.title}. "
            if album.artist:
                content += f"Nghệ sĩ: {album.artist.name}. "
            if album.release_date:
                content += f"Ngày phát hành: {album.release_date}. "
            
            chunk = DocumentChunk(
                content=content,
                source_type='album',
                source_id=album.id
            )
            embedding = self.model.encode(content)
            chunk.embedding = embedding.tolist()
            chunk.save()
    
    def search(self, query, top_k=5):
        """Tìm kiếm các document chunks liên quan đến query"""
        if not self.index:
            return []
        
        # Tạo embedding cho query
        query_embedding = self.model.encode(query)
        query_embedding = np.array([query_embedding], dtype=np.float32)
        
        # Tìm kiếm trong index
        distances, indices = self.index.search(query_embedding, top_k)
        
        results = []
        for i, idx in enumerate(indices[0]):
            if idx < len(self.document_ids) and idx >= 0:
                doc_id = self.document_ids[idx]
                try:
                    doc = DocumentChunk.objects.get(id=doc_id)
                    results.append({
                        'content': doc.content,
                        'source_type': doc.source_type,
                        'source_id': doc.source_id,
                        'score': float(distances[0][i])
                    })
                except DocumentChunk.DoesNotExist:
                    continue
        
        return results