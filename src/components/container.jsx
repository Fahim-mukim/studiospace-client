export function Container({ as: Element = "div", className = "", ...props }) {
  return (
    <Element
      className={`mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-12 ${className}`}
      {...props}
    />
  );
}
