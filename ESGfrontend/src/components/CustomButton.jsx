const CustomButton = ({ name }) => {
  return (
    <button className="custom-button bg-[#002A85] text-white min-w-[1.7rem] min-h-[1.3rem] rounded-[0.22rem] text-[0.9rem] font-medium px-2 py-1 hover:bg-[#001F66] transition-all">
      {name}
    </button>
  );
};

export default CustomButton;
