using FluentValidation;
using ITM.Emprendimientos.Application.DTOs.Requests;

namespace ITM.Emprendimientos.Application.Validators;

public class ActualizarPerfilAdminValidator
    : AbstractValidator<ActualizarPerfilAdminRequest>
{
    private static readonly string[] Formatos = { "image/jpeg", "image/png", "image/webp" };
    private const long MaxBytes = 3 * 1024 * 1024;

    public ActualizarPerfilAdminValidator()
    {
        RuleFor(x => x.Descripcion)
            .MaximumLength(300).WithMessage("La descripción no puede superar 300 caracteres.")
            .When(x => x.Descripcion is not null);

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