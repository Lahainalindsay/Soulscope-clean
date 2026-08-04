type SignatureFieldProps = {
  compact?: boolean;
  title?: string;
};

export function SignatureField({
  compact = false,
  title = "Unified interference field",
}: SignatureFieldProps) {
  return (
    <section className="ss-signature-column" aria-label="Resonance signature">
      <div className="ss-signature-header">
        <div>
          <p className="ss-technical-label">Resonance signature</p>
          <span>{title}</span>
        </div>

        <div className="ss-signature-header-right">
          <span>Visual prototype</span>
          <span className="ss-live-mark">
            <i />
            Static field
          </span>
        </div>
      </div>

      <div
        className={`ss-signature-field${compact ? " ss-signature-field-compact" : ""}`}
        role="img"
        aria-label="Decorative SoulScope resonance signature placeholder with asymmetric cyan, blue, mint, and violet contours. This visual has no scientific meaning."
      >
        <div className="ss-axis ss-axis-top">Cognitive form</div>
        <div className="ss-axis ss-axis-right">Regulatory motion</div>
        <div className="ss-axis ss-axis-bottom">Available capacity</div>
        <div className="ss-axis ss-axis-left">Expressive interface</div>

        <svg className="ss-signature-svg" viewBox="0 0 900 820" aria-hidden="true">
          <defs>
            <radialGradient id="fieldGlowWide" cx="47%" cy="44%" r="62%">
              <stop offset="0%" stopColor="#61E7EC" stopOpacity="0.18" />
              <stop offset="34%" stopColor="#168CFF" stopOpacity="0.09" />
              <stop offset="64%" stopColor="#9856FF" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#030B14" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="fieldStroke" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#61E7EC" />
              <stop offset="45%" stopColor="#168CFF" />
              <stop offset="75%" stopColor="#B8F5ED" />
              <stop offset="100%" stopColor="#9856FF" />
            </linearGradient>

            <linearGradient id="spineWide" x1="0" y1="0" x2="0.8" y2="1">
              <stop offset="0%" stopColor="#9856FF" stopOpacity="0" />
              <stop offset="23%" stopColor="#61E7EC" />
              <stop offset="52%" stopColor="#F4F6FF" />
              <stop offset="78%" stopColor="#B8F5ED" />
              <stop offset="100%" stopColor="#168CFF" stopOpacity="0" />
            </linearGradient>

            <filter id="softFieldGlow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="9" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="brightCoreGlow" x="-120%" y="-120%" width="340%" height="340%">
              <feGaussianBlur stdDeviation="16" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <ellipse cx="438" cy="400" rx="384" ry="312" fill="url(#fieldGlowWide)" />

          <g className="ss-field-rings">
            <ellipse cx="438" cy="400" rx="374" ry="286" />
            <ellipse cx="462" cy="382" rx="302" ry="224" />
            <ellipse cx="417" cy="421" rx="238" ry="178" />
          </g>

          <path
            className="ss-contour ss-contour-outer"
            d="M421 72 C560 76 694 142 742 261 C796 394 750 531 641 626 C548 706 433 728 312 690 C178 648 91 547 83 417 C75 276 167 150 296 100 C337 84 378 75 421 72 Z"
          />

          <path
            className="ss-contour ss-contour-cyan"
            d="M400 128 C526 103 646 171 693 281 C741 394 700 507 611 582 C524 656 420 663 323 626 C221 587 146 510 136 409 C125 292 199 192 303 153 C335 141 366 134 400 128 Z"
          />

          <path
            className="ss-contour ss-contour-blue"
            d="M455 178 C551 181 631 238 657 330 C684 425 641 515 558 566 C483 612 392 606 319 558 C239 506 201 430 218 348 C235 263 311 198 395 184 C416 180 435 178 455 178 Z"
          />

          <path
            className="ss-contour ss-contour-mint"
            d="M365 229 C454 200 545 233 589 303 C636 378 613 461 548 512 C486 560 406 572 334 536 C263 499 229 430 244 356 C258 289 303 250 365 229 Z"
          />

          <path
            className="ss-contour ss-contour-violet"
            d="M472 279 C534 288 574 335 571 391 C568 454 514 501 449 507 C379 513 313 477 298 416 C285 363 315 311 368 290 C400 277 438 274 472 279 Z"
          />

          <path
            className="ss-flow-line ss-flow-one"
            d="M128 449 C213 369 292 344 363 373 C431 401 452 469 520 474 C591 480 651 425 750 326"
          />

          <path
            className="ss-flow-line ss-flow-two"
            d="M170 302 C252 359 331 353 392 297 C450 244 502 250 565 310 C614 357 668 367 733 333"
          />

          <path
            className="ss-flow-line ss-flow-three"
            d="M207 570 C284 511 353 497 411 528 C475 562 530 556 609 487"
          />

          <path
            className="ss-spine"
            d="M524 82 C468 164 511 226 462 305 C415 380 455 432 411 503 C373 565 391 622 342 712"
          />

          <path
            className="ss-spine-secondary"
            d="M553 146 C512 206 537 258 495 324 C452 393 479 443 438 504 C407 551 418 599 386 653"
          />

          <circle className="ss-core" cx="438" cy="427" r="6" filter="url(#brightCoreGlow)" />
          <circle cx="438" cy="427" r="42" fill="none" stroke="#61E7EC" strokeOpacity="0.18" />
        </svg>

        <div className="ss-signature-warning">
          Visual placeholder · no scientific meaning
        </div>
      </div>
    </section>
  );
}
