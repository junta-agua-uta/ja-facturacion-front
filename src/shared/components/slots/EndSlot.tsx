type EndSlotProps = {
    children: React.ReactNode;
  };

  const EndSlot = ({ children }: EndSlotProps) => {
    return (
      <div className="flex justify-end mb-4">
        {children}
      </div>
    );
  };
  
  export default EndSlot;