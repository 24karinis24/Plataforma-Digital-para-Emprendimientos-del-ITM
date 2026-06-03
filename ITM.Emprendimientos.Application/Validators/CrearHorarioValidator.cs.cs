using FluentValidation;
using ITM.Emprendimientos.Application.DTOs.Requests;

namespace ITM.Emprendimientos.Application.Validators;

public class CrearHorarioValidator : AbstractValidator<CrearHorarioRequest>
{
    public CrearHorarioValidator()
    {
        RuleFor(x => x.Dia)
            .InclusiveBetween(0, 6)
            .WithMessage("El día debe ser entre 0 (Lunes) y 6 (Domingo).");

        RuleFor(x => x.HoraApertura)
            .NotEmpty().WithMessage("La hora de apertura es obligatoria.")
            .Matches(@"^([0-1]\d|2[0-3]):[0-5]\d$")
            .WithMessage("Formato inválido. Use HH:mm (ej: 08:00).");

        RuleFor(x => x.HoraCierre)
            .NotEmpty().WithMessage("La hora de cierre es obligatoria.")
            .Matches(@"^([0-1]\d|2[0-3]):[0-5]\d$")
            .WithMessage("Formato inválido. Use HH:mm (ej: 17:00).");

        RuleFor(x => x)
            .Must(x => string.Compare(x.HoraCierre, x.HoraApertura,
                       StringComparison.Ordinal) > 0)
            .WithMessage("La hora de cierre debe ser posterior a la de apertura.")
            .When(x => !string.IsNullOrWhiteSpace(x.HoraApertura)
                    && !string.IsNullOrWhiteSpace(x.HoraCierre));

        RuleFor(x => x.Sede)
            .NotEmpty().WithMessage("La sede es obligatoria.")
            .MaximumLength(100).WithMessage("La sede no puede superar 100 caracteres.");
    }
}