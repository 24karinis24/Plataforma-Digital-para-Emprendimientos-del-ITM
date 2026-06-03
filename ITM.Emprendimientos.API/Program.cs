using FluentValidation;
using ITM.Emprendimientos.API.Mappings;
using ITM.Emprendimientos.API.Middlewares;
using ITM.Emprendimientos.Application.DTOs.Requests;
using ITM.Emprendimientos.Application.Facades;
using ITM.Emprendimientos.Application.Services;
using ITM.Emprendimientos.Application.Validators;
using ITM.Emprendimientos.DataAccess.Context;
using ITM.Emprendimientos.DataAccess.ExternalServices;
using ITM.Emprendimientos.DataAccess.Repositories;
using ITM.Emprendimientos.DataAccess.Security;
using ITM.Emprendimientos.Domain.Interfaces;
using ITM.Emprendimientos.Domain.Interfaces.Repositories;
using ITM.Emprendimientos.Domain.Observers;
using ITM.Emprendimientos.Domain.Strategies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ── Entity Framework Core ──────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));

// ── Repositorios ───────────────────────────────────────────────────────
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
builder.Services.AddScoped<IProductoRepository, ProductoRepository>();
builder.Services.AddScoped<ICategoriaRepository, CategoriaRepository>();
builder.Services.AddScoped<IHorarioRepository, HorarioRepository>();
builder.Services.AddScoped<IUbicacionRepository, UbicacionRepository>();
builder.Services.AddScoped<IAuditoriaRepository, AuditoriaRepository>();

// ── Servicios de Aplicación ────────────────────────────────────────────
builder.Services.AddScoped<UsuarioService>();
builder.Services.AddScoped<CategoriaService>();
builder.Services.AddScoped<ProductoService>();
builder.Services.AddScoped<ProductoQueryService>();
builder.Services.AddScoped<ProductoFacade>();
builder.Services.AddScoped<PerfilService>();
builder.Services.AddScoped<HorarioService>();
builder.Services.AddScoped<UbicacionService>();

// ── Patrón Strategy ────────────────────────────────────────────────────
builder.Services.AddScoped<IProductoFiltroStrategy, FiltroPorNombre>();
builder.Services.AddScoped<IProductoFiltroStrategy, FiltroPorCategoria>();
builder.Services.AddScoped<ProductoFiltroStrategySelector>();

// ── Patrón Observer ────────────────────────────────────────────────────
builder.Services.AddScoped<IObservadorProducto, CatalogoObserver>();
builder.Services.AddScoped<IObservadorProducto, AuditoriaObserver>();

// ── Supabase (IFotosService) ───────────────────────────────────────────
builder.Services.AddHttpClient<IFotosService, FotosComponent>();

// ── Seguridad ──────────────────────────────────────────────────────────
builder.Services.AddScoped<JwtTokenService>();

// ── Validadores ────────────────────────────────────────────────────────
builder.Services.AddScoped<IValidator<RegistroRequest>, RegistroValidator>();
builder.Services.AddScoped<IValidator<LoginRequest>, LoginValidator>();
builder.Services.AddScoped<IValidator<CategoriaRequest>, CategoriaValidator>();
builder.Services.AddScoped<IValidator<CrearProductoRequest>, CrearProductoValidator>();
builder.Services.AddScoped<IValidator<ActualizarProductoRequest>, ActualizarProductoValidator>();
builder.Services.AddScoped<IValidator<CambiarEstadoRequest>, CambiarEstadoValidator>();
builder.Services.AddScoped<IValidator<ActualizarPerfilEmprendedorRequest>, ActualizarPerfilEmprendedorValidator>();
builder.Services.AddScoped<IValidator<ActualizarPerfilCompradorRequest>, ActualizarPerfilCompradorValidator>();
builder.Services.AddScoped<IValidator<ActualizarPerfilAdminRequest>, ActualizarPerfilAdminValidator>();
builder.Services.AddScoped<IValidator<CrearHorarioRequest>, CrearHorarioValidator>();
builder.Services.AddScoped<IValidator<ActualizarHorarioRequest>, ActualizarHorarioValidator>();
builder.Services.AddScoped<IValidator<CrearUbicacionRequest>, CrearUbicacionValidator>();
builder.Services.AddScoped<IValidator<ActualizarUbicacionRequest>, ActualizarUbicacionValidator>();


// ── AutoMapper ─────────────────────────────────────────────────────────
builder.Services.AddAutoMapper(typeof(MappingProfile).Assembly);

// ── CORS ───────────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
    options.AddPolicy("FrontendPolicy", policy =>
        policy.WithOrigins(
                  builder.Configuration["Frontend:Url"] ?? "http://localhost:5500",
                  "http://127.0.0.1:5500")
              .AllowAnyHeader()
              .AllowAnyMethod()));

// ── JWT Authentication ─────────────────────────────────────────────────
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT Key no configurada.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                                           Encoding.UTF8.GetBytes(jwtKey))
        });

builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "ITM Emprendimientos API",
        Version = "v1"
    });
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Ingresar: Bearer {token}"
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id   = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

app.UseMiddleware<ErrorHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/", () => Results.Redirect("/swagger"));
app.UseCors("FrontendPolicy");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();