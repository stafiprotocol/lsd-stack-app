interface Props {
  msg: string;
}

export const InputErrorTip = ({ msg }: Props) => {
  return <div className="text-[.12rem] text-[#FF2782] pl-[1.45rem]">{msg}</div>;
};
