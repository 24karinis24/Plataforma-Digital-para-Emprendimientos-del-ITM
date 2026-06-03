namespace ITM.Emprendimientos.Application.DTOs.Requests;

public class CrearHorarioRequest
{
    public int Dia { get; set; }  // 0=Lunes … 6=Domingo
    public string HoraApertura { get; set; } = string.Empty;  // "HH:mm"
    public string HoraCierre { get; set; } = string.Empty;
    public string Sede { get; set; } = string.Empty;
}