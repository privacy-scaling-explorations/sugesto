import { SystemStyleObject } from "@chakra-ui/react"
import { Styles } from "@chakra-ui/theme-tools"

const styles: Styles = {
    global: (): SystemStyleObject => ({
        body: {
            bg: "white",
            color: "text.700"
        },
        "body, #__next, div[data-rk]": {
            minHeight: "100vh"
        },
        "#__next, div[data-rk]": {
            display: "flex",
            flexDirection: "column"
        }
    })
}

export default styles
