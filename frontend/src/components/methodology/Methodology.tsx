import { useData } from "context/DataContext"
import styled from "styled-components"

const Methodology = () => {
  const { isMobile } = useData()
  return (
    <Container>
      <Title>{"Index Methodology"}</Title>
      <SubTitle>
        <No>{"1."}</No>
        {"Summary"}
      </SubTitle>
      <Text>
        {
          "A price to sales (P/S) ratio weighted smart beta index by Token Terminal (TTI)."
        }
      </Text>
      <Text>
        {
          "Token Terminal is a leading data analytics provider focused on the fundamentals of crypto protocols. We track metrics such as revenue and earnings to gauge the actual usage and performance of different crypto protocols. Over the past year, we’ve witnessed increasing interest towards our chosen methodology, and believe that a broadly available index product based on that same methodology could generate significant interest among the community."
        }
      </Text>

      <SubTitle>
        <No>{"2."}</No>
        {"Objective"}
      </SubTitle>
      <Text>
        {
          "Smart beta. In contrast to traditional market cap-based indexes, smart beta indexes employ alternative index construction rules with the aim of improving a portfolio’s risk-adjusted returns. These indexes seek to combine the benefits of passive investing and the advantages of active investing strategies."
        }
      </Text>
      <Text>
        {
          "Token Terminal smart beta index (TTI). The TTI uses a fundamentals-based ruleset for its index construction. Assets included in the TTI are chosen primarily based on their price to sales (P/S) ratio. The price to sales (P/S) ratio compares a protocol’s market cap to its revenues. A low ratio could imply that the protocol is undervalued and vice versa."
        }
      </Text>
      <Text>
        {
          "The price to sales (P/S) ratio is an ideal valuation method especially for early-stage protocols, which often have little or no net income. Given the nascency of the crypto market, we believe that the price to sales (P/S) ratio offers a highly accurate tool for relative analysis between different crypto protocols."
        }
      </Text>

      <SubTitle style={{ fontSize: isMobile ? "16px" : "20px" }}>
        <No>{"2.1"}</No>
        {"Size of opportunity"}
      </SubTitle>
      <Text>
        {
          "Our institutional clients have expressed interest towards an index product that is easily understandable for investors coming from traditional finance. The value proposition of a price to sales (P/S) based index is that it optimizes for fairly valued and widely used protocols and thus lowers the threshold for institutional investors looking to gain exposure to decentralized finance (DeFi). We believe that cohorts of investors with increasing levels of sophistication are quickly being onboarded into the crypto space, which will contribute to the next cycle of crypto adoption being driven more by fundamentals than the previous cycles. We believe that the methodology chosen for the TTI will make it an ideal vehicle for anyone who wishes to capitalise on this trend."
        }
      </Text>

      <SubTitle style={{ fontSize: isMobile ? "16px" : "20px" }}>
        <No>{"2.2"}</No>
        {"Differentiation"}
      </SubTitle>
      <Text>
        {
          "Market cap-based indexes offer a low-cost and easily accessible alternative for investors looking to diversify their cryptoasset exposure. We believe that the TTI could serve as a great fundamentals-based complement to market cap-based indexes and over time, especially as the crypto market and the asset universe expand, evolve to offer its investors differentiated exposure to revenue-generating and fairly valued crypto protocols."
        }
      </Text>

      <SubTitle>
        <No>{"3."}</No>
        {"Methodology"}
      </SubTitle>

      <SubTitle style={{ fontSize: isMobile ? "16px" : "20px" }}>
        <No>{"3.1"}</No>
        {"Index calculations"}
      </SubTitle>
      <Text>
        {
          "The TTI uses a forward price to sales (P/S) ratio that is calculated based on a protocol’s past 30-day average revenue. Formula for the forward price to sales (P/S) ratio: fully diluted market cap / annualised revenue (calculated as a simple 30 day moving average * 365)."
        }
      </Text>

      <SubTitle style={{ fontSize: isMobile ? "16px" : "20px" }}>
        <No>{"3.2"}</No>
        {"Token inclusion criteria"}
      </SubTitle>
      <Text>
        {
          "Eligible tokens are those that meet the following technical, market and safety requirements:"
        }
      </Text>

      <SubTitle
        style={{ marginLeft: 10, fontSize: isMobile ? "16px" : "20px" }}
      >
        <No>{"3.2.1"}</No>
        {"Technical requirements"}
      </SubTitle>
      <Text>
        <ul>
          <li>{"The token must be available on the Ethereum blockchain."}</li>
          <li>{"The token must be listed on Token Terminal."} </li>
          <li>
            {
              "The token must not be considered a security by the corresponding authorities across different jurisdictions."
            }
          </li>
          <li>
            {
              "The token must be the native token of a protocol or a wrapped version thereof."
            }
          </li>
        </ul>
      </Text>

      <SubTitle
        style={{ marginLeft: 10, fontSize: isMobile ? "16px" : "20px" }}
      >
        <No>{"3.2.2"}</No>
        {"Market requirements"}
      </SubTitle>
      <Text>
        <ul>
          <li>
            {
              "The token must have a capped supply or it must be possible to reasonably predict the token’s supply over the next five years."
            }
          </li>
          <li>
            {
              "The token must have sufficient liquidity for initial inclusion and rebalances. [technical details to be confirmed after DG1 in cooperation with Index Coop]."
            }
          </li>
          <li>
            {
              "The token’s economics must not have locking, minting or other patterns that would significantly disadvantage passive holders."
            }
          </li>
        </ul>
      </Text>
      <SubTitle
        style={{ marginLeft: 10, fontSize: isMobile ? "16px" : "20px" }}
      >
        <No>{"3.2.3"}</No>
        {"Safety requirements"}
      </SubTitle>
      <Text>
        <ul>
          <li>
            {
              "The protocol must have been launched at least 90 days before inclusion."
            }
          </li>
          <li>
            {
              "The protocol must be recognised as having a high-quality product and team."
            }
          </li>
          <li>
            {
              "The protocol must have sufficient resources for future development."
            }
          </li>
          <li>
            {
              "The protocol must be actively developed and must not be insolvent."
            }
          </li>
          <li>
            {
              "The protocol must have conducted sufficient security audits and/or security professionals must have reviewed the protocol to determine that security best practices have been followed."
            }
          </li>
        </ul>
      </Text>
      <SubTitle>
        <No>{"4. "}</No>
        {"Index maintenance"}
      </SubTitle>
      <Text>
        {
          "The TTI is maintained by the Index Coop in cooperation with Token Terminal as the methodologist. The TTI would be maintained monthly in two phases:"
        }
      </Text>
      <Text style={{ fontWeight: "bold" }}>{"i) Determination phase"}</Text>
      <Text>
        {
          "The determination phase takes place during the last week of the month. It is the phase when the changes needed for the next reconstitution are determined."
        }
      </Text>
      <Text>
        {
          "Price to sales (P/S) ratio determination: the TTI references Token Terminal’s price to sales (P/S) ratio. The price to sales (P/S) ratio is determined during the last week of the month and published before the monthly reconstitution."
        }
      </Text>

      <Text>{`Additions and deletions: The tokens being added and deleted from the index calculation are determined during the last week of the month and published before the monthly reconstitution.`}</Text>

      <Text style={{ fontWeight: "bold" }}>{`ii) Reconstitution phase`}</Text>

      <Text>{`The index components are adjusted, added and deleted as per the instructions published after the end of the determination phase. New index weightings, additions and deletions are incorporated into the index during the monthly reconstitution, which will take place on the first business day of the month. As assets tracked by the index grow, the reconstitution window will expand to more than one day to lower the reconstitution’s market impact.`}</Text>

      <SubTitle>
        <No>{"5. "}</No>
        {"Author background and commitment"}
      </SubTitle>

      <Text>
        {
          "This proposal has been drafted by the team at Token Terminal. Token Terminal was launched at the end of 2019 with the aim to create institutional-grade analytics tools for cryptoasset investors."
        }
      </Text>

      <Text>{"As a methodologist Token Terminal will:"}</Text>

      <ul style={{ marginTop: "20px", fontWeight: "normal" }}>
        <li>
          {
            "Provide an initial but complete methodology for the proposed index."
          }
        </li>
        <li>
          {
            "Propose new assets to be added to the index product in accordance with the inclusion criteria."
          }
        </li>
        <li>
          {
            "Collaborate with the Index Coop in all aspects related to the proposed index."
          }
        </li>
        <li>
          {
            "Update Token Terminal’s community (Twitter / Newsletter) on index products offered by the Index Coop."
          }
        </li>
        <li>
          {
            "Launch a dashboard (on Token Terminal’s new portal) that includes all index products offered by the Index Coop."
          }
        </li>
      </ul>
    </Container>
  )
}

export default Methodology

const Title = styled.div`
  font-weight: bold;
  font-size: 30px;
  text-align: center;

  @media (max-width: 720px) {
    font-size: 24px;
  }
`

const Text = styled.div`
  margin-top: 10px;

  font-weight: normal;

  @media (max-width: 720px) {
    font-size: 12px;
  }

  ul {
    font-weight: normal;
    margin-left: 0px;
    margin-top: 0px;
  }
`

const No = styled.div`
  margin-right: 10px;
`

const SubTitle = styled.div`
  display: flex;

  font-size: 24px;
  margin-top: 30px;

  @media (max-width: 720px) {
    font-size: 18px;
  }
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 80px 0px;

  width: 50%;
  margin: 0 auto;
  font-weight: bold;

  @media (max-width: 720px) {
    padding: 40px;
    width: calc(100% - 80px);
    font-size: 12px;
  }
`
