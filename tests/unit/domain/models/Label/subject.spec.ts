import { TextLines } from "@/domain/models/Line/Observer";
import { TextLineSplitter } from "@/domain/models/Line/TextLineSplitter";
import { TextWidthCalculator } from "@/domain/models/Line/Strategy";
import { Font } from "@/domain/models/Line/Font";
import { EntityLabel, EntityLabels } from "@/domain/models/Line/Shape";
import { Entity, Entities } from "@/domain/models/Label/Entity";

jest.mock("@/domain/models/Line/Font");
jest.mock("@/domain/models/Line/Shape");
const FontMock = Font as jest.Mock;
const EntityLabelMock = EntityLabel as jest.Mock;
const EntityLabelsMock = EntityLabels as jest.Mock;

describe("Subject", () => {
  const text = "Biden";
  const maxWidth = 2;
  FontMock.mockImplementationOnce(() => {
    return {
      widthOfChar: (): number => {
        return 1;
      },
    };
  });

  EntityLabelMock.mockImplementationOnce(() => {
    return {
      width: (): number => {
        return maxWidth;
      },
    };
  });

  EntityLabelsMock.mockImplementationOnce(() => {
    return {
      maxLabelWidth: (): number => {
        return 1;
      },
      getById: (): EntityLabel => {
        return new EntityLabelMock();
      },
    };
  });
  const font = new FontMock();
  const entityLabels = new EntityLabelsMock();
  const calculator = new TextWidthCalculator(font, maxWidth);
  const splitter = new TextLineSplitter(calculator, entityLabels);

  beforeEach(() => {
    calculator.reset();
  });

  it("initial run", () => {
    const entities = new Entities([]);
    const lines = new TextLines(text, splitter);
    entities.register(lines);
    entities.update([new Entity(0, 0, 0, 0, 5)]);

    expect(lines.list().length).toEqual(3);
    const expected = [
      [0, 2],
      [2, 4],
      [4, 5],
    ];
    let i = 0;
    for (const line of lines.list()) {
      expect([line.startOffset, line.endOffset]).toEqual(expected[i++]);
    }
  });

  it("update", () => {
    const entities = new Entities([new Entity(0, 0, 0, 0, 5)]);
    const lines = new TextLines(text, splitter);
    entities.register(lines);
    entities.update([new Entity(0, 0, 0, 3, 5)]);

    expect(lines.list().length).toEqual(3);
    const expected = [
      [0, 2],
      [2, 3],
      [3, 5],
    ];
    let i = 0;
    for (const line of lines.list()) {
      expect([line.startOffset, line.endOffset]).toEqual(expected[i++]);
    }
  });

  it("delete", () => {
    const entities = new Entities([new Entity(0, 0, 0, 0, 5)]);
    const lines = new TextLines(text, splitter);
    entities.register(lines);
    entities.update([]);

    expect(lines.list().length).toEqual(3);
    const expected = [
      [0, 2],
      [2, 4],
      [4, 5],
    ];
    let i = 0;
    for (const line of lines.list()) {
      expect([line.startOffset, line.endOffset]).toEqual(expected[i++]);
    }
  });
});
