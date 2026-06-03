using FluentValidation;
using ITM.Emprendimientos.Application.DTOs.Requests;

namespace ITM.Emprendimientos.Application.Validators;

public class ActualizarHorarioValidator : AbstractValidator<ActualizarHorarioRequest>
{
    public ActualizarHorarioValidator()
    {
        RuleFor(x => x.Dia)
            .InclusiveBetween(0, 6).WithMessage("Día inválido. Use 0–6.");

        RuleFor(x => x.HoraApertura)
            .NotEmpty().WithMessage("La hora de apertura es obligatoria.")
            .Matches(@"^([0-1]\d|2[0-3]):[0-5]\d$")
            .WithMessage("Formato inválido. Use HH:mm.");

        RuleFor(x => x.HoraCierre)
            .NotEmpty().WithMessage("La hora de cierre es obligatoria.")
            .Matches(@"^([0-1]\d|2[0-3]):[0-5]\d$")
            .WithMessage("Formato inválido. Use HH:mm.");

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