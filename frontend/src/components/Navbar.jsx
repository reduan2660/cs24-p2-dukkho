import { BiSolidLeaf } from "react-icons/bi";

const Navbar = () => {
  return (
    <div className="sticky top-0 block w-full bg-xlightestgray py-3 shadow-md lg:hidden">
      <div>
        <div className="flex items-center gap-x-4 pl-3">
          <BiSolidLeaf className="text-xl text-green-600" />
          <p className="text-lg font-bold text-xdark lg:text-5xl">EcoSync</p>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
