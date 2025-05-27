const CustomButton = ({ name }) => {
  return (
    <button
      className="bg-[#002A85] text-white w-[142px] h-[39px] rounded-[8px] text-[14px] font-medium px-[16px] hover:bg-[#001F66] transition-all"
    >
      {name}
    </button>
  );
};

export default CustomButton;
