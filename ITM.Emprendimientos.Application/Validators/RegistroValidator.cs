using FluentValidation;
using ITM.Emprendimientos.Application.DTOs.Requests;

namespace ITM.Emprendimientos.Application.Validators;

public class RegistroValidator : AbstractValidator<RegistroRequest>
{
    public RegistroValidator()
    {
        RuleFor(x => x.Nombre)
            .NotEmpty().WithMessage("El nombre es obligatorio.")
            .MinimumLength(2).WithMessage("El nombre debe tener al menos 2 caracteres.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("El email es obligatorio.")
            .EmailAddress().WithMessage("El email no tiene un formato válido.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("La contraseña es obligatoria.")
            .MinimumLength(6).WithMessage("La contraseña debe tener al menos 6 caracteres.");

        RuleFor(x => x.TipoUsuario)
            .InclusiveBetween(0, 2)
            .WithMessage("TipoUsuario debe ser 0 (Admin), 1 (Emprendedor) o 2 (Comprador).");
    }
}