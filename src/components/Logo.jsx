import LogoXquest from "../assets/logo.png"
export default function Logo() {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="text-white font-bold text-xl">
        <img src={LogoXquest} width={150} />
      </div>
    </div>
  );
}
