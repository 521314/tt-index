import styled from "styled-components"

type Props = { checked: boolean; onClick: () => void }
const Toggle = ({ onClick, checked }: Props) => (
  <Label>
    <Input onChange={onClick} checked={checked} type="checkbox" />
    <Slider />
  </Label>
)

const Label = styled.label`
  position: relative;
  display: inline-block;
  width: 36px;
  min-width: 36px;
  height: 20px;

  &: > input {
    opacity: 0;
    width: 0;
    height: 0;
  }
`

const Slider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: 0.4s;
  transition: 0.4s;

  border-radius: 34px;

  &:before {
    position: absolute;
    content: "";
    height: 14px;
    width: 14px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    -webkit-transition: 0.4s;
    transition: 0.4s;
    border-radius: 50%;
  }
`

const Input = styled.input`
  &:checked + span {
    background-color: #00cf9d;
  }

  &:focus + span {
    box-shadow: 0 0 1px #00cf9d;
  }

  &:checked + span:before {
    -webkit-transform: translateX(16px);
    -ms-transform: translateX(16px);
    transform: translateX(16px);
  }
`

export default Toggle
