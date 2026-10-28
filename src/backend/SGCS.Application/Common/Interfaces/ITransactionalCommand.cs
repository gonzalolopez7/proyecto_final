namespace SGCS.Application.Common.Interfaces;

/// <summary>
/// Marker interface para commands que requieren transacción.
/// El TransactionBehavior detecta esta interfaz y envuelve la ejecución en BeginTransaction/Commit/Rollback.
/// </summary>
public interface ITransactionalCommand { }
