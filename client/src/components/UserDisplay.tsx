import "./UserDisplay.css"
import { Container, Header, Segment, Table } from "semantic-ui-react"
import { UserData } from "../types"

type Props = {
  user: UserData | null
}

const UserDisplay = ({user }: Props) => {
  if (!user) return
  const { name, email} = user
  const {first, last} = name

  return (
    <div className="userTable">
      <Segment attached="bottom">
        <Container>
          <Table celled striped>
            <Table.Body>
              <Table.Row>
                <Table.Cell collapsing>First Name</Table.Cell>
                <Table.Cell>{first}</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell collapsing>Last Name</Table.Cell>
                <Table.Cell>{last}</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell collapsing>Email</Table.Cell>
                <Table.Cell>{email}</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </Container>
      </Segment>
    </div>
  )
}

export default UserDisplay
