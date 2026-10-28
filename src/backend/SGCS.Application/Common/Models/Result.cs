namespace SGCS.Application.Common.Models;

/// <summary>
/// Wrapper para resultados de operaciones, encapsulando éxito/fracaso y errores tipados.
/// Usado por IIdentityService y features que no deben lanzar excepciones de control de flujo.
/// </summary>
public class Result
{
    protected Result(bool succeeded, IEnumerable<Error> errors)
    {
        Succeeded = succeeded;
        Errors = errors.ToArray();
    }

    protected Result(bool succeeded, Error error)
    {
        Succeeded = succeeded;
        Errors = error == Error.None ? [] : [error];
    }

    public bool Succeeded { get; }
    public Error[] Errors { get; }

    /// <summary>
    /// Retorna el error principal (el primero de la colección) o Error.None si la operación fue exitosa.
    /// </summary>
    public Error Error => Errors.Length > 0 ? Errors[0] : Error.None;

    public static Result Success()
        => new(true, Error.None);

    public static Result Failure(Error error)
        => new(false, error);

    public static Result Failure(IEnumerable<Error> errors)
        => new(false, errors);

    public static implicit operator Result(Error error) => Failure(error);
}

/// <summary>
/// Versión genérica de Result que incluye un valor de retorno cuando la operación es exitosa.
/// </summary>
public class Result<T> : Result
{
    private readonly T? _value;

    private Result(bool succeeded, T? value, IEnumerable<Error> errors)
        : base(succeeded, errors)
    {
        _value = value;
    }

    private Result(bool succeeded, T? value, Error error)
        : base(succeeded, error)
    {
        _value = value;
    }

    public T Value => Succeeded
        ? _value!
        : throw new InvalidOperationException("The value of a failure result cannot be accessed.");

    public static Result<T> Success(T value) => new(true, value, Error.None);
    public static new Result<T> Failure(Error error) => new(false, default, error);
    public static new Result<T> Failure(IEnumerable<Error> errors) => new(false, default, errors);

    public static implicit operator Result<T>(T value) => Success(value);
    public static implicit operator Result<T>(Error error) => Failure(error);
}