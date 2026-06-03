using FluentValidation;
using ITM.Emprendimientos.Application.DTOs.Requests;

namespace ITM.Emprendimientos.Application.Validators;

public class ActualizarPerfilEmprendedorValidator
    : AbstractValidator<ActualizarPerfilEmprendedorRequest>
{
    private static readonly string[] Formatos = { "image/jpeg", "image/png", "image/webp" };
    private const long MaxBytes = 3 * 1024 * 1024;

    public ActualizarPerfilEmprendedorValidator()
    {
        RuleFor(x => x.NombreEmprendimiento)
            .NotEmpty().WithMessage("El nombre del emprendimiento es obligatorio.")
            .MaximumLength(100).WithMessage("El nombre no puede superar 100 caracteres.");

        RuleFor(x => x.Descripcion)
            .NotEmpty().WithMessage("La descripción es obligatoria.")
            .MaximumLength(500).WithMessage("La descripción no puede superar 500 caracteres.");

        When(x => x.Foto is not null, () =>
        {
            RuleFor(x => x.Foto!.Length)
                .LessThanOrEqualTo(MaxBytes).WithMessage("La foto no puede superar 3 MB.");
            RuleFor(x => x.Foto!.ContentType)
                .Must(ct => Formatos.Contains(ct))
                .WithMessage("Solo se permiten imágenes JPEG, PNG o WebP.");
        });
    }
}