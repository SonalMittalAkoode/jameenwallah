'use client'

import React, { useState, useCallback } from 'react'
import Link from 'next/link'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcEmi(principal, annualRate, tenureYears) {
  if (!principal || !annualRate || !tenureYears) return { emi: 0, totalAmount: 0, totalInterest: 0 }
  const r = annualRate / (12 * 100)
  const n = tenureYears * 12
  if (r === 0) {
    const emi = principal / n
    return { emi, totalAmount: principal, totalInterest: 0 }
  }
  const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  const totalAmount = emi * n
  const totalInterest = totalAmount - principal
  return { emi, totalAmount, totalInterest }
}

function formatInr(value) {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(Math.round(value))
}

function formatInrShort(value) {
  if (value >= 10_00_00_000) return `₹${(value / 10_00_00_000).toFixed(1)}Cr`
  if (value >= 1_00_000) return `₹${(value / 1_00_000).toFixed(0)}L`
  return `₹${formatInr(value)}`
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SliderField({ label, value, min, max, step, unit, unitBefore, minLabel, maxLabel, onChange }) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className='emi-field'>
      <label className='emi-field__label'>{label}</label>
      <div className='emi-field__input-row'>
        {unitBefore && <span className='emi-field__unit emi-field__unit--before'>{unitBefore}</span>}
        <input
          type='number'
          className='emi-field__number'
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={e => onChange(Number(e.target.value))}
          aria-label={label}
        />
        {unit && <span className='emi-field__unit'>{unit}</span>}
      </div>
      <div className='emi-field__slider-wrap'>
        <input
          type='range'
          className='emi-slider'
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ '--pct': `${pct}%` }}
          aria-label={label}
        />
        <div className='emi-field__range-labels'>
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      </div>
    </div>
  )
}

function BreakdownRow({ label, value, highlight }) {
  return (
    <div className={`emi-breakdown__row${highlight ? ' emi-breakdown__row--highlight' : ''}`}>
      <span className='emi-breakdown__label'>{label}</span>
      <span className={`emi-breakdown__value${highlight ? ' emi-breakdown__value--primary' : ''}`}>
        ₹{formatInr(value)}
      </span>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const EmiCalculator = () => {
  const [loanAmount, setLoanAmount] = useState(5_000_000)
  const [interestRate, setInterestRate] = useState(8.5)
  const [tenure, setTenure] = useState(20)

  const clamp = (val, min, max) => Math.min(Math.max(val, min), max)

  const handleLoan = useCallback(v => setLoanAmount(clamp(v, 100_000, 5_000_0000)), [])
  const handleRate = useCallback(v => setInterestRate(clamp(v, 1, 20)), [])
  const handleTenure = useCallback(v => setTenure(clamp(v, 1, 30)), [])

  const { emi, totalAmount, totalInterest } = calcEmi(loanAmount, interestRate, tenure)

  return (
    <section className='emi-section pb70 pb30-md'>
      <div className='container'>
        {/* Section Header */}
        <div className='row'>
          <div className='col-lg-6 m-auto' data-aos='fade-up'>
            <div className='main-title2 text-center mb50'>
              <h2 className='title'>EMI Calculator</h2>
              <p className='paragraph'>
                Calculate your monthly EMI and plan your property loan efficiently
              </p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className='row' data-aos='fade-up' data-aos-delay='100'>
          <div className='col-lg-12 mx-auto'>
            <div className='emi-card'>
              {/* Left – inputs */}
              <div className='emi-card__left'>
                <h5 className='emi-card__section-title'>Loan Details</h5>

                <div className="emi-inputs-row">
                  <SliderField
                    label='Loan Amount'
                    value={loanAmount}
                    min={100_000}
                    max={5_000_0000}
                    step={10_000}
                    unitBefore='₹'
                    minLabel='₹1L'
                    maxLabel='₹50L'
                    onChange={handleLoan}
                  />

                  <SliderField
                    label='Interest Rate'
                    value={interestRate}
                    min={1}
                    max={20}
                    step={0.1}
                    unit='%'
                    minLabel='1%'
                    maxLabel='20%'
                    onChange={handleRate}
                  />

                  <SliderField
                    label='Loan Tenure'
                    value={tenure}
                    min={1}
                    max={30}
                    step={1}
                    unit='Yrs'
                    minLabel='1 Year'
                    maxLabel='30 Years'
                    onChange={handleTenure}
                  />
                </div>
              </div>

              {/* Divider */}
              <div className='emi-card__divider' />

              {/* Right – breakdown */}
              <div className='emi-card__right'>
                <h5 className='emi-card__section-title'>Your EMI Breakdown</h5>

                <div className='emi-breakdown'>
                  <BreakdownRow label='Monthly EMI' value={emi} highlight />
                  <BreakdownRow label='Total Amount' value={totalAmount} />
                  <BreakdownRow label='Total Interest' value={totalInterest} />
                  <BreakdownRow label='Principal Amount' value={loanAmount} />
                </div>

                <Link
                  href='/contact'
                  className='ud-btn btn-thm w-100 text-center mt30 emi-connect-btn'
                >
                  <i className='fal fa-user-tie me-2' />
                  Connect to the Banker
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default EmiCalculator
