function Button({ children, onClick, className }) {
  let btnClassName = "btn";

  if (className) {
    btnClassName = "btn " + className;
  }

  return (
    <button type="button" className={btnClassName} onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;
