export default function KpiCard({
  label,
  value,
  detail,
  warning = false,
}) {

  return (

    <article
      className={
        `kpi ${warning ? 'warn' : ''}`
      }
    >

      <span className="lbl">
        {label}
      </span>

      <strong className="val">
        {value}
      </strong>

      <span className="delta">
        {detail}
      </span>

    </article>

  );
}