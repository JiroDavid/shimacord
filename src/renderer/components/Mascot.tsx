import icon from '../assets/icon.png'

type Props = { size?: number; mood?: 'idle' | 'happy' }

export function Mascot({ size = 96, mood = 'idle' }: Props) {
  return (
    <img
      src={icon}
      alt="Shimacord mascot"
      width={size}
      height={size}
      data-mood={mood}
      className="select-none object-contain"
      draggable={false}
    />
  )
}
