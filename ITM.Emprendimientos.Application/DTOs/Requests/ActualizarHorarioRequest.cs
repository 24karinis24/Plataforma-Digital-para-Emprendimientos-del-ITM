namespace ITM.Emprendimientos.Application.DTOs.Requests;

public class ActualizarHorarioRequest
{
    public int Dia { get; set; }
    public string HoraApertura { get; set; } = string.Empty;
    public string HoraCierre { get; set; } = string.Empty;
    public string Sede { get; set; } = string.Empty;
}