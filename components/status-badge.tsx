export function Status({ value }: { value: string }) {
  return (
    <span
      className={`status ${value.toLowerCase().replaceAll(" ", "-").replace("ç", "c")}`}
    >
      <i />
      {value}
    </span>
  );
}
