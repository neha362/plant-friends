import { Container, Header, Segment, Table } from "semantic-ui-react"
import { UserData } from "../types"

type UserProps = {
  user: UserData | null
}

const Login = () => {
    const first = "";
    const last = "";
    const email = "";
  return (
    <>
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
    </>
  )
}

export default Login
