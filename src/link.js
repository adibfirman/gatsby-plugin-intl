import React from "react"
import PropTypes from "prop-types"
import { Link as GatsbyLink, navigate as gatsbyNavigate } from "gatsby"
import qs from "query-string";

import { IntlContextConsumer } from "./intl-context"

const Link = ({ to, language, children, onClick, ...rest }) => (
  <IntlContextConsumer>
    {intl => {
      const languageLink = language || intl.language
      const link = intl.routed || language ? `/${languageLink}${to}` : `${to}`

      const handleClick = e => {
        if (language) {
          localStorage.setItem("gatsby-intl-language", language)
        }
        if (onClick) {
          onClick(e)
        }
      }

      return (
        <GatsbyLink {...rest} to={link} onClick={handleClick}>
          {children}
        </GatsbyLink>
      )
    }}
  </IntlContextConsumer>
)

Link.propTypes = {
  children: PropTypes.node.isRequired,
  to: PropTypes.string,
  language: PropTypes.string,
}

Link.defaultProps = {
  to: "",
}

export default Link

export const navigate = (to, options) => {
  if (typeof window === "undefined") {
    return
  }

  const { language, routed } = window.___gatsbyIntl
  const link = routed ? `/${language}${to}` : `${to}`
  gatsbyNavigate(link, options)
}

export const changeLocale = ({ language, to, withHash }) => {
  if (typeof window === "undefined") {
    return
  }
  const { routed } = window.___gatsbyIntl

  const removePrefix = pathname => {
    const base =
      typeof __BASE_PATH__ !== `undefined` ? __BASE_PATH__ : __PATH_PREFIX__
    if (base && pathname.indexOf(base) === 0) {
      pathname = pathname.slice(base.length)
    }
    return pathname
  }

  const removeLocalePart = pathname => {
    if (!routed) {
      return pathname
    }
    const i = pathname.indexOf(`/`, 1)
    return pathname.substring(i)
  }

  const pathname = to || removeLocalePart(removePrefix(window.location.pathname))
  let browserSearch = window.location.search
  let link

  if (withHash) {
    const parseQueryString = qs.parse(window.location.search)
    const newQueryString = { lang: language, ...parseQueryString}
    const queryToString = qs.stringify(newQueryString)

    browserSearch = `?${queryToString}`
    link = `${pathname}${browserSearch}`
  } else link = `/${language}${pathname}${browserSearch}`

  localStorage.setItem("gatsby-intl-language", language)
  gatsbyNavigate(link)
}
