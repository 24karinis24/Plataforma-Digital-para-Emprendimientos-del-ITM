using ITM.Emprendimientos.Domain.Enums;

namespace ITM.Emprendimientos.Domain.Entities;

public class Horario : AuditBase
{
    public DiaSemana Dia { get; set; }
    public TimeOnly HoraApertura { get; set; }
    public TimeOnly HoraCierre { get; set; }
    public string Sede { get; set; } = string.Empty;

    // Foreign Key
    public Guid EmprendedorId { get; set; }

    // Navigation Property
    public Emprendedor Emprendedor { get; set; } = null!;
}