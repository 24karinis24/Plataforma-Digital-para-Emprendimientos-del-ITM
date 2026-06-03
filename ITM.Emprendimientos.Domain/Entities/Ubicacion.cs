namespace ITM.Emprendimientos.Domain.Entities;

public class Ubicacion : AuditBase
{
    public string NombreSede { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string? ReferenciaMapa { get; set; }

    // Foreign Key
    public Guid EmprendedorId { get; set; }

    // Navigation Property
    public Emprendedor Emprendedor { get; set; } = null!;
}