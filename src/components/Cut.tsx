import { Box, IconButton } from "@mui/joy"
import { Grip, X } from "lucide-react"
import { Rnd } from "react-rnd"

type CutProps = {
	containerRef: HTMLDivElement | null
	id: string
	onRemove: () => void
}

export const CUT_SIZE=150

const Cut = ({
	containerRef,
	id, 
	onRemove,
}: CutProps) => {

	return (
		<Box
			id={id}
			component={Rnd}
			default={{
				x: (containerRef!.clientWidth/2) + window.scrollX - CUT_SIZE,
				y: window.innerHeight/2 + window.scrollY - CUT_SIZE,
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
