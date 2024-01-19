import { Box, IconButton } from "@mui/joy"
import { Grip, X } from "lucide-react"
import { useRef } from "react"
import { Rnd } from "react-rnd"

type CutProps = {
	id: string,
	onRemove: () => void
}

export const CUT_SIZE=150

const Cut = ({
	id, 
	onRemove
}: CutProps) => {
	const boxRef = useRef(null)

	return (
		<Box
			ref={boxRef}
			id={id}
			component={Rnd}
			default={{
				x: 0,
				y: 0,
				width: CUT_SIZE *2,
				height: CUT_SIZE *2,
			}}
			sx={{
				position: "relative",
				transition: `
					background-color ease .2s,
					backdrop-filter ease .2s,
					border-color ease .2s,
					color ease .2s
				`,
				backgroundColor: "transparent",
				backdropFilter: "brightness(0.9)",
				border: "4px solid",
				borderColor: "primary.500",
				color: "transparent",

				"&:hover": {
					backgroundColor: "rgba(199, 233, 247, 0.5)",
					backdropFilter: "brightness(1.2)",
					borderColor: "primary.500",
					color: "primary.500",
				}
			}}
		>
			<IconButton
				color="primary"
				variant="solid"
				sx={{
					position: "absolute",
					top: -20,
					left: -20,
					zIndex: 1
				}}
				onClick={onRemove}
			>
				<X />
			</IconButton>

			<Box
				component={Grip}
				sx={{
					position: "absolute",
					top: 8,
					right: 8,
				}}
			/>
			<Box
				component={Grip}
				sx={{
					position: "absolute",
					bottom: 8,
					right: 8,
				}}
			/>

			<Box
				component={Grip}
				sx={{
					position: "absolute",
					bottom: 8,
					left: 8,
				}}
			/>
		</Box>
	)
}

export default Cut
