namespace ITM.Emprendimientos.Domain.Enums;

public enum EstadoProducto
{
    Activo = 0,   // Visible en catálogo, disponible para el comprador
    Inactivo = 1,   // Oculto del catálogo; el emprendedor lo desactivó
    Eliminado = 2    // Eliminado por admin; no se borra físicamente de la BD
}