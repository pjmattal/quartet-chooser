import * as React from "react"
import * as Utils from "../lib/utils"

import Layout from '../components/layout'

import {
    tableMobile,
    tableBig,
    playIcon
} from './work.module.css'

function age(completed, birth){
    // https://stackoverflow.com/a/24181701/2683
    return new Date(new Date(completed) - new Date(birth)).getFullYear() - 1969;
}

export default function Work({ pageContext }) {
    console.log(pageContext);
    const work = pageContext.node;
    const title = Utils.get_work_title(work);
    const composerInfo = pageContext.data.composers.find(c => c.name === work.composer);
    const siblings = pageContext.data.greats.filter(w => w.catalog === work.catalog && w.composer === work.composer);
    const image = Utils.get_image(work.composer);
    let nickname = Utils.work_nickname(work, siblings);
    let nick = nickname ? ( <i>&nbsp;&mdash;&nbsp;{nickname}</i> ) : null;
    let imslp = w => w.imslp ? w.imslp : w.opus_imslp ? w.opus_imslp : null;
    let composer_url = "/" + work.composer + "/";
    let name = work.composer + ": " + title + " in " + work.key; // TOOD: nick?
    let aged = age(work.completed, composerInfo.birth);

    const mvmts = pageContext.data.movements.filter(m =>
        m.composer === work.composer &&
        m.catalog === work.catalog &&
        m.work_number === work.work_number
    ).sort((x, y) => x.movement_number - y.movement_number);

    let style = function(composer, work){
        if (composer.name === "Bach"){
            return "bullets";
        }
        if (work.catalog === "Opus 133" && composer.name === "Beethoven"){
            return "none";
        }
        return "table"; // return "numerals";
    }

    let player = function (m){
        // let url = "https://open.spotify.com/embed?uri=" + m.spotify;
        if (Utils.is_mobile()) {
            return (<a
                href={m.spotify} className={playIcon}>
                    <img src="/play.png" alt="play" className={playIcon}/>
                </a>)
        }
        else {
            return (<iframe
                src={m.spotify.replace("/track/", "/embed/track/")}
                title={m.title}
                width="100%" height="80" frameBorder="0" allowFullScreen=""
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy" >
            </iframe>);
        }
    }

    const items = mvmts.map(m => (
        <li key={m.movement_number} title={m.key}>
            {m.title}
            {player(m)}
        </li>
    ));

    // mvmt #, mvmt title, link
    const mvmt_table = (
        <table className={Utils.is_mobile() ? tableMobile : tableBig}>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Movement</th>
                    <th>Recording</th>
                </tr>
            </thead>
            <tbody>
                {
                    mvmts.map(m => (
                        <tr key={m.movement_number}>
                            <td>{Utils.to_roman(m.movement_number)}</td>
                            <td title={m.title}>{m.title}</td>
                            <td>{player(m)}</td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    );

    return (
        <Layout pageTitle={name} >
            <a href={composer_url}>
                <img
                    alt={composerInfo.full_name}
                    src={image}
                    height={300}
                />
            </a>

            <h1><a href={composer_url}>{work.composer}</a>: {title} in {work.key} {nick}</h1>
            {(work.opus_nickname !== "") ?
                (<p>Group nickname: {work.opus_nickname}</p>) : null
            }

            <p>
                Completed in {work.completed}, the year he turned {aged}.
                &nbsp;{Utils.sentence_case(work.notes)}
                &nbsp;Read more on <a href={work.wikipedia}>wikipedia</a>.
            </p>

            {
                {
                    "bullets": (
                        <ul>
                            {items}
                        </ul>
                    ),
                    "numerals": (
                        <ol type="I" start={mvmts[0].movement_number}>
                            {items}
                        </ol>
                    ),
                    "table": (
                        mvmt_table
                    ),
                    "none": player(mvmts[0])
                }[style(composerInfo, work)]
            }

            <p>
            {composerInfo.quartets > 1 ?
                (<i>See other quartets by <a href={composer_url}>{work.composer}</a>. </i>) : null
            }

            {imslp(work) ?
                (<i>Check out the score on  <a href={imslp(work)}>IMSLP</a>.</i>) : null
            }
            </p>
        </Layout>
    )
}

function getTitle(pageContext){
    const work = pageContext.node;
    const title = Utils.get_work_title(work);

    let name = work.composer + ": " + title + " in " + work.key;
    return name +  " | Quartet Roulette";
}

function getImage(pageContext){
    const work = pageContext.node;
    return "https://quartetroulette.com/" + Utils.get_image(work.composer);
}

export const Head = ({ location, params, data, pageContext }) => (
    <>
        <title>{getTitle(pageContext)}</title>
        <meta property="og:title" content={getTitle(pageContext)} />
        <meta property="og:description" content={getTitle(pageContext)} />
        <meta property="og:image" content={getImage(pageContext)} />
    </>
)
