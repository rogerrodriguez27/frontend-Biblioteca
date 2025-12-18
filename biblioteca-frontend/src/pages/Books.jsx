import { useState, useEffect } from 'react';
import { 
    Box, Button, Typography, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Paper, IconButton, 
    Dialog, DialogTitle, DialogContent, TextField, DialogActions,
    List, ListItem, ListItemText, Divider, Chip, InputAdornment
} from '@mui/material';
import { Add, Edit, Delete, LibraryBooks, Search } from '@mui/icons-material';
import Swal from 'sweetalert2';
import api from '../api/axiosConfig';

const Books = () => {
    // --- ESTADOS ---
    const [books, setBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState(''); // <--- NUEVO ESTADO PARA BÚSQUEDA
    
    // Estados para Modales
    const [openBookModal, setOpenBookModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [bookFormData, setBookFormData] = useState({
        libroId: 0, titulo: '', autor: '', editorial: '', isbn: '', anioPublicacion: '', categoriaId: 1
    });

    const [openCopiesModal, setOpenCopiesModal] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null); 
    const [copies, setCopies] = useState([]); 
    const [copyFormData, setCopyFormData] = useState({ codigoBarras: '', ubicacion: '' });

    // CARGAR LIBROS
    const fetchBooks = async () => {
        try {
            const response = await api.get('/books');
            setBooks(response.data);
        } catch (error) {
            console.error("Error cargando libros:", error);
        }
    };

    useEffect(() => { fetchBooks(); }, []);

    // ==========================================
    // LÓGICA DE FILTRADO (BÚSQUEDA INTELIGENTE)
    // ==========================================
    const filteredBooks = books.filter((book) => {
        // Convertimos todo a minúsculas para que no importen las mayúsculas
        const searchLower = searchTerm.toLowerCase();
        
        return (
            book.titulo.toLowerCase().includes(searchLower) ||
            book.autor.toLowerCase().includes(searchLower) ||
            book.isbn.toLowerCase().includes(searchLower)
        );
    });

    // ==========================================
    // LÓGICA DE LIBROS (PADRE)
    // ==========================================
    
    const handleOpenBookModal = (book = null) => {
        if (book) {
            setIsEdit(true);
            setBookFormData(book);
        } else {
            setIsEdit(false);
            setBookFormData({ libroId: 0, titulo: '', autor: '', editorial: '', isbn: '', anioPublicacion: '', categoriaId: 1 });
        }
        setOpenBookModal(true);
    };

    const handleSaveBook = async () => {
        try {
            const inquilinoId = parseInt(localStorage.getItem('inquilinoId'));
            const payload = { ...bookFormData, inquilinoId };

            if (isEdit) {
                await api.put(`/books/${bookFormData.libroId}`, payload);
                Swal.fire('Actualizado', 'Libro actualizado', 'success');
            } else {
                await api.post('/books', payload);
                Swal.fire('Creado', 'Libro creado', 'success');
            }
            setOpenBookModal(false);
            fetchBooks();
        } catch (error) {
            Swal.fire('Error', 'No se pudo guardar el libro', 'error');
        }
    };

    const handleDeleteBook = (id) => {
        Swal.fire({
            title: '¿Eliminar libro?',
            text: "Se eliminarán también todas sus copias físicas DISPONIBLES.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar todo',
            confirmButtonColor: '#d33'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/books/${id}`);
                    Swal.fire('Eliminado', 'Libro eliminado', 'success');
                    fetchBooks();
                } catch (error) {
                    Swal.fire('Error', error.response?.data || 'No se puede eliminar', 'error');
                }
            }
        });
    };

    // ==========================================
    // LÓGICA DE COPIAS
    // ==========================================

    const loadCopies = async (bookId) => {
        try {
            const response = await api.get('/copies');
            const bookCopies = response.data.filter(c => c.libroId === bookId);
            setCopies(bookCopies);
        } catch (error) {
            console.error(error);
        }
    };

    const handleOpenCopies = (book) => {
        setSelectedBook(book);
        setCopyFormData({ codigoBarras: '', ubicacion: '' });
        loadCopies(book.libroId);
        setOpenCopiesModal(true);
    };

    const handleAddCopy = async () => {
        if (!copyFormData.codigoBarras) return;
        try {
            const inquilinoId = parseInt(localStorage.getItem('inquilinoId'));
            const payload = {
                inquilinoId,
                libroId: selectedBook.libroId,
                codigoBarras: copyFormData.codigoBarras,
                ubicacion: copyFormData.ubicacion || 'Recepción',
                estado: 'Disponible'
            };
            await api.post('/copies', payload);
            loadCopies(selectedBook.libroId); 
            setCopyFormData({ codigoBarras: '', ubicacion: '' });
            Swal.fire({ icon: 'success', title: 'Copia Agregada', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
        } catch (error) {
            Swal.fire('Error', 'No se pudo agregar la copia', 'error');
        }
    };

    const handleDeleteCopy = (copyId) => {
        Swal.fire({
            title: '¿Borrar copia?',
            text: "Eliminarás este ejemplar físico.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, borrar',
            confirmButtonColor: '#d33',
            toast: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/copies/${copyId}`);
                    loadCopies(selectedBook.libroId);
                    Swal.fire({ icon: 'success', title: 'Copia eliminada', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
                } catch (error) {
                    Swal.fire('Error', 'No se puede borrar (¿Está prestada?)', 'error');
                }
            }
        });
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                <Typography variant="h4" fontWeight="bold">Catálogo de Libros</Typography>
                
                {/* BARRA DE BÚSQUEDA NUEVA */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Buscar por Título, Autor o ISBN..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ width: 300, bgcolor: 'white' }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenBookModal()}>
                        Nuevo Título
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper} elevation={2}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell fontWeight="bold">Título</TableCell>
                            <TableCell>Autor</TableCell>
                            <TableCell>ISBN</TableCell>
                            <TableCell align="center">Copias Físicas</TableCell>
                            <TableCell align="center">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {/* AHORA MAPEAMOS 'filteredBooks' EN LUGAR DE 'books' */}
                        {filteredBooks.map((book) => (
                            <TableRow key={book.libroId} hover>
                                <TableCell sx={{ fontWeight: 'bold' }}>{book.titulo}</TableCell>
                                <TableCell>{book.autor}</TableCell>
                                <TableCell>{book.isbn}</TableCell>
                                <TableCell align="center">
                                    <Button variant="outlined" size="small" startIcon={<LibraryBooks />} onClick={() => handleOpenCopies(book)}>
                                        Inventario
                                    </Button>
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton color="primary" onClick={() => handleOpenBookModal(book)}><Edit /></IconButton>
                                    <IconButton color="error" onClick={() => handleDeleteBook(book.libroId)}><Delete /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        
                        {/* MENSAJE SI NO HAY RESULTADOS */}
                        {filteredBooks.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        No se encontraron libros que coincidan con la búsqueda.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* MODAL 1: LIBRO */}
            <Dialog open={openBookModal} onClose={() => setOpenBookModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{isEdit ? 'Editar Libro' : 'Nuevo Libro'}</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Título" fullWidth value={bookFormData.titulo} onChange={(e) => setBookFormData({...bookFormData, titulo: e.target.value})} />
                    <TextField margin="dense" label="Autor" fullWidth value={bookFormData.autor} onChange={(e) => setBookFormData({...bookFormData, autor: e.target.value})} />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField margin="dense" label="Editorial" fullWidth value={bookFormData.editorial} onChange={(e) => setBookFormData({...bookFormData, editorial: e.target.value})} />
                        <TextField margin="dense" label="Año" type="number" fullWidth value={bookFormData.anioPublicacion} onChange={(e) => setBookFormData({...bookFormData, anioPublicacion: e.target.value})} />
                    </Box>
                    <TextField margin="dense" label="ISBN" fullWidth value={bookFormData.isbn} onChange={(e) => setBookFormData({...bookFormData, isbn: e.target.value})} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenBookModal(false)} color="secondary">Cancelar</Button>
                    <Button onClick={handleSaveBook} variant="contained">Guardar</Button>
                </DialogActions>
            </Dialog>

            {/* MODAL 2: INVENTARIO */}
            <Dialog open={openCopiesModal} onClose={() => setOpenCopiesModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: '#e3f2fd' }}>Inventario: {selectedBook?.titulo}</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, mb: 3, display: 'flex', gap: 1, alignItems: 'center' }}>
                        <TextField label="Código de Barras (Ej: L001)" size="small" fullWidth value={copyFormData.codigoBarras} onChange={(e) => setCopyFormData({...copyFormData, codigoBarras: e.target.value})} />
                        <TextField label="Ubicación" size="small" fullWidth value={copyFormData.ubicacion} onChange={(e) => setCopyFormData({...copyFormData, ubicacion: e.target.value})} />
                        <Button variant="contained" onClick={handleAddCopy} disabled={!copyFormData.codigoBarras}>Agregar</Button>
                    </Box>
                    <Divider sx={{ mb: 2 }}>COPIAS REGISTRADAS</Divider>
                    <List dense sx={{ maxHeight: 200, overflow: 'auto', bgcolor: '#fafafa', borderRadius: 1 }}>
                        {copies.length === 0 ? (
                            <Typography variant="body2" sx={{ p: 2, textAlign: 'center', color: 'gray' }}>No hay copias físicas registradas.</Typography>
                        ) : (
                            copies.map((copy) => (
                                <ListItem 
                                    key={copy.ejemplarId} 
                                    divider
                                    secondaryAction={
                                        <IconButton edge="end" aria-label="delete" color="error" onClick={() => handleDeleteCopy(copy.ejemplarId)}>
                                            <Delete />
                                        </IconButton>
                                    }
                                >
                                    <ListItemText primary={`Código: ${copy.codigoBarras}`} secondary={`Ubicación: ${copy.ubicacion || 'Sin asignar'}`} />
                                    <Chip label={copy.estado} color={copy.estado === 'Disponible' ? 'success' : 'warning'} size="small" sx={{ mr: 2 }} />
                                </ListItem>
                            ))
                        )}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCopiesModal(false)}>Cerrar Inventario</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Books;